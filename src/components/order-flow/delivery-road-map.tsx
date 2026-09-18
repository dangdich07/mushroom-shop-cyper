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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const vehicleMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
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

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [105.844, 21.31],
      zoom: 8.2,
      minZoom: 6,
      maxZoom: 17,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.on("load", () => setMapReady(true));
    mapRef.current = map;

    return () => {
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
    <div className="relative mt-5 min-h-[360px] w-full overflow-hidden border border-primary-cyan/25 bg-background-deep sm:min-h-[440px]">
      <div
        ref={containerRef}
        aria-label="Bản đồ tuyến đường từ kho Hà Nội đến điểm giao Thái Nguyên"
        className="absolute inset-0"
      />

      {!mapReady && (
        <div role="status" className="absolute inset-0 z-10 grid place-items-center bg-background-deep/90 px-6 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-primary-cyan">
          Đang tải bản đồ đường bộ...
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 z-10 max-w-[calc(100%-1.5rem)] border border-white/15 bg-background-deep/90 px-3 py-2 text-right font-mono text-[9px] uppercase text-text-muted shadow-lg backdrop-blur-sm">
        <strong className="block text-primary-cyan">Hà Nội → Thái Nguyên</strong>
        <span>{routeState === "READY" ? "Tuyến đường thực tế" : routeState === "LOADING" ? "Đang tính tuyến đường..." : "Tuyến nối dự phòng"}</span>
      </div>
    </div>
  );
}
