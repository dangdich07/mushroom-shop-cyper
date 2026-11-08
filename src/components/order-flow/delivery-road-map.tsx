"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, LngLatLike, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface DeliveryRoadMapProps {
  status: string;
  usesBike: boolean;
}

type RouteState = "LOADING" | "READY" | "FALLBACK";
type Coordinate = [longitude: number, latitude: number];

const HANOI_WAREHOUSE: Coordinate = [105.8342, 21.0278];
const THAI_NGUYEN_DESTINATION: Coordinate = [105.8542, 21.5942];
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
// Serve the matching distribution unchanged: Turbopack cannot resolve the
// package's automatic import.meta.url worker path reliably.
const MAP_WORKER_URL = "/vendor/maplibre/6.9.0/maplibre-gl-worker.mjs";
const ROUTING_URL = `https://router.project-osrm.org/route/v1/driving/${HANOI_WAREHOUSE.join(",")};${THAI_NGUYEN_DESTINATION.join(",")}?overview=full&geometries=geojson&steps=false`;

const progressByStatus: Record<string, number> = {
  PENDING: 0,
  PROCESSING: 0.12,
  SHIPPED: 0.62,
  DELIVERED: 1,
  CANCELLED: 0,
};

function createMapMarker(label: string, symbol: string, accent: string) {
  const marker = document.createElement("div");
  marker.setAttribute("aria-label", label);
  marker.style.position = "relative";
  marker.style.display = "grid";
  marker.style.placeItems = "center";
  marker.style.width = "34px";
  marker.style.height = "34px";
  marker.style.border = `2px solid ${accent}`;
  marker.style.borderRadius = "9999px";
  marker.style.background = "#07111f";
  marker.style.color = "#ffffff";
  marker.style.fontSize = "17px";
  marker.style.boxShadow = `0 0 18px ${accent}88`;
  marker.style.cursor = "default";
  marker.textContent = symbol;

  const caption = document.createElement("span");
  caption.textContent = label;
  caption.style.position = "absolute";
  caption.style.left = "50%";
  caption.style.bottom = "calc(100% + 7px)";
  caption.style.transform = "translateX(-50%)";
  caption.style.width = "max-content";
  caption.style.maxWidth = "180px";
  caption.style.padding = "5px 8px";
  caption.style.border = `1px solid ${accent}66`;
  caption.style.background = "rgba(3, 7, 18, 0.94)";
  caption.style.color = "#ffffff";
  caption.style.fontFamily = "var(--font-jetbrains-mono), monospace";
  caption.style.fontSize = "9px";
  caption.style.fontWeight = "700";
  caption.style.lineHeight = "1.25";
  caption.style.textAlign = "center";
  caption.style.textTransform = "uppercase";
  caption.style.whiteSpace = "normal";
  caption.style.pointerEvents = "none";
  marker.appendChild(caption);

  return marker;
}

function coordinateAtProgress(coordinates: Coordinate[], progress: number): Coordinate {
  if (coordinates.length === 0) return HANOI_WAREHOUSE;
  const boundedProgress = Math.max(0, Math.min(1, progress));
  const index = Math.min(coordinates.length - 1, Math.round((coordinates.length - 1) * boundedProgress));
  return coordinates[index];
}

export function DeliveryRoadMap({ status, usesBike }: DeliveryRoadMapProps) {
  const [attempt, setAttempt] = useState(0);
  return <DeliveryRoadMapInstance key={attempt} status={status} usesBike={usesBike} onRetry={() => setAttempt((previous) => previous + 1)} />;
}

function DeliveryRoadMapInstance({ status, usesBike, onRetry }: DeliveryRoadMapProps & { onRetry: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const vehicleMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeState, setRouteState] = useState<RouteState>("LOADING");
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    HANOI_WAREHOUSE,
    THAI_NGUYEN_DESTINATION,
  ]);

  const normalizedStatus = status.toUpperCase();
  const progress = progressByStatus[normalizedStatus] ?? 0;
  const vehicleLabel = normalizedStatus === "DELIVERED"
    ? "Đã đến điểm nhận"
    : normalizedStatus === "CANCELLED"
      ? "Hành trình đã hủy"
      : usesBike
        ? "Xe máy giao hàng"
        : "Xe tải giao hàng";

  const vehicleSymbol = useMemo(() => {
    if (normalizedStatus === "CANCELLED") return "×";
    return usesBike ? "🏍" : "🚚";
  }, [normalizedStatus, usesBike]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      maplibregl.setWorkerUrl(new URL(MAP_WORKER_URL, window.location.origin).href);
      map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [105.844, 21.31],
      zoom: 8.2,
      minZoom: 6,
      maxZoom: 17,
      attributionControl: false,
      });
    } catch (error) {
      console.error("Không thể khởi tạo bản đồ:", error);
      setMapError("Không thể khởi tạo bản đồ. Vui lòng kiểm tra hỗ trợ WebGL và tăng tốc đồ họa của trình duyệt.");
      return;
    }

    let loaded = false;
    const timeout = window.setTimeout(() => {
      if (!loaded) setMapError("Bản đồ tải quá lâu. Vui lòng kiểm tra kết nối và thử lại.");
    }, 15000);
    const handleLoad = () => {
      loaded = true;
      window.clearTimeout(timeout);
      setMapError(null);
      setMapReady(true);
    };
    const handleError = (event: maplibregl.ErrorEvent) => {
      console.error("Lỗi tải bản đồ:", event.error);
      if (!loaded) setMapError("Không tải được bản đồ nền. Vui lòng kiểm tra kết nối và thử lại.");
    };

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.on("load", handleLoad);
    map.on("error", handleError);
    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      window.clearTimeout(timeout);
      resizeObserver.disconnect();
      map.off("load", handleLoad);
      map.off("error", handleError);
      vehicleMarkerRef.current?.remove();
      vehicleMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoadRoute() {
      try {
        const response = await fetch(ROUTING_URL, { signal: controller.signal });
        if (!response.ok) throw new Error("ROUTE_REQUEST_FAILED");

        const payload = await response.json() as {
          routes?: Array<{ geometry?: { coordinates?: Coordinate[] } }>;
        };
        const roadCoordinates = payload.routes?.[0]?.geometry?.coordinates;
        if (!roadCoordinates || roadCoordinates.length < 2) throw new Error("ROUTE_NOT_FOUND");

        setCoordinates(roadCoordinates);
        setRouteState("READY");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Không thể tải tuyến đường thực tế, đang dùng đường nối dự phòng.", error);
        setCoordinates([HANOI_WAREHOUSE, THAI_NGUYEN_DESTINATION]);
        setRouteState("FALLBACK");
      }
    }

    void loadRoadRoute();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const routeData: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates },
    };

    const existingSource = map.getSource("delivery-route") as GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(routeData);
    } else {
      map.addSource("delivery-route", { type: "geojson", data: routeData });
      map.addLayer({
        id: "delivery-route-outline",
        type: "line",
        source: "delivery-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#032b33", "line-width": 9, "line-opacity": 0.72 },
      });
      map.addLayer({
        id: "delivery-route-line",
        type: "line",
        source: "delivery-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": normalizedStatus === "CANCELLED" ? "#fb7185" : "#00d9ff",
          "line-width": 4,
          "line-opacity": normalizedStatus === "CANCELLED" ? 0.55 : 0.95,
        },
      });
    }

    if (map.getLayer("delivery-route-line")) {
      map.setPaintProperty(
        "delivery-route-line",
        "line-color",
        normalizedStatus === "CANCELLED" ? "#fb7185" : "#00d9ff",
      );
      map.setPaintProperty(
        "delivery-route-line",
        "line-opacity",
        normalizedStatus === "CANCELLED" ? 0.55 : 0.95,
      );
    }

    const bounds = coordinates.reduce(
      (currentBounds, coordinate) => currentBounds.extend(coordinate as LngLatLike),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );
    map.fitBounds(bounds, { padding: 58, duration: 0, maxZoom: 10.5 });
  }, [coordinates, mapReady, normalizedStatus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const warehouseMarker = new maplibregl.Marker({
      element: createMapMarker("Kho Hà Nội", "K", "#00d9ff"),
      anchor: "center",
    }).setLngLat(HANOI_WAREHOUSE).addTo(map);

    const destinationMarker = new maplibregl.Marker({
      element: createMapMarker("Điểm giao Thái Nguyên", "Đ", "#22c55e"),
      anchor: "center",
    }).setLngLat(THAI_NGUYEN_DESTINATION).addTo(map);

    return () => {
      warehouseMarker.remove();
      destinationMarker.remove();
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    vehicleMarkerRef.current?.remove();
    const marker = new maplibregl.Marker({
      element: createMapMarker(vehicleLabel, vehicleSymbol, normalizedStatus === "CANCELLED" ? "#fb7185" : "#00f5ff"),
      anchor: "center",
    })
      .setLngLat(coordinateAtProgress(coordinates, progress))
      .addTo(map);
    vehicleMarkerRef.current = marker;

    return () => {
      marker.remove();
      if (vehicleMarkerRef.current === marker) vehicleMarkerRef.current = null;
    };
  }, [coordinates, mapReady, normalizedStatus, progress, vehicleLabel, vehicleSymbol]);

  return (
    <div className="relative mt-3 h-[320px] min-h-[320px] w-full overflow-hidden rounded-lg border border-primary-cyan/30 bg-background-deep sm:h-[clamp(320px,44vh,440px)]">
      <div
        ref={containerRef}
        aria-label="Bản đồ tuyến đường từ kho Hà Nội đến điểm giao Thái Nguyên"
        // MapLibre adds an unlayered position:relative rule which overrides
        // Tailwind utilities. Keep the host pinned to the entire map frame.
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {mapError ? (
        <div role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background-deep/95 px-6 text-center">
          <p className="max-w-md text-sm leading-6 text-text-muted">{mapError}</p>
          <button type="button" onClick={onRetry} className="min-h-11 rounded-lg border border-primary-cyan/40 bg-primary-cyan/10 px-5 text-sm font-semibold text-primary-cyan hover:bg-primary-cyan/20 focus-visible:bio-focus">Thử lại bản đồ</button>
        </div>
      ) : !mapReady && (
        <div role="status" className="absolute inset-0 z-10 grid place-items-center bg-background-deep/90 px-6 text-center text-sm font-medium text-primary-cyan">
          Đang tải bản đồ đường bộ...
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 z-10 max-w-[calc(100%-1.5rem)] rounded-lg border border-primary-cyan/25 bg-background-deep/90 px-3 py-2 text-right text-[11px] text-text-muted shadow-lg backdrop-blur-sm">
        <strong className="block text-primary-cyan">Hà Nội → Thái Nguyên</strong>
        <span>{routeState === "READY" ? "Tuyến đường thực tế" : routeState === "LOADING" ? "Đang tính tuyến đường..." : "Tuyến nối dự phòng"}</span>
      </div>
    </div>
  );
}
