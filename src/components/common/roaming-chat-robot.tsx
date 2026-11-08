"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import styles from "./roaming-chat-robot.module.css";

interface RoamingChatRobotProps {
  onOpen: () => void;
}

const ROBOT_SIZE = 56;
const EDGE_GAP = 14;
const TOP_SAFE_GAP = 96;

export function RoamingChatRobot({ onOpen }: RoamingChatRobotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; left: number; top: number } | null>(null);
  const draggedRef = useRef(false);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    let frameId = 0;
    let previousTime = 0;
    let turnAt = 0;
    let velocityX = -50;
    let velocityY = -30.5;
    let targetVelocityX = velocityX;
    let targetVelocityY = velocityY;

    const bounds = () => {
      const width = button.offsetWidth || ROBOT_SIZE;
      const height = button.offsetHeight || ROBOT_SIZE;
      return {
        minX: EDGE_GAP,
        minY: Math.min(TOP_SAFE_GAP, Math.max(EDGE_GAP, window.innerHeight - height - EDGE_GAP)),
        maxX: Math.max(EDGE_GAP, window.innerWidth - width - EDGE_GAP),
        maxY: Math.max(TOP_SAFE_GAP, window.innerHeight - height - EDGE_GAP),
      };
    };

    const clampToViewport = () => {
      const area = bounds();
      const currentLeft = Number.parseFloat(button.style.left);
      const currentTop = Number.parseFloat(button.style.top);
      const left = Number.isFinite(currentLeft) ? Math.min(Math.max(area.minX, currentLeft), area.maxX) : area.maxX - 10;
      const top = Number.isFinite(currentTop) ? Math.min(Math.max(area.minY, currentTop), area.maxY) : area.maxY - 10;
      button.style.left = `${left}px`;
      button.style.top = `${top}px`;
    };

    const animate = (time: number) => {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0;
      previousTime = time;
      const isPaused = dragRef.current !== null || hoveredRef.current;
      button.dataset.moving = !isPaused ? "true" : "false";

      if (!isPaused && document.visibilityState === "visible") {
        const area = bounds();
        let x = Number.parseFloat(button.style.left) || area.maxX;
        let y = Number.parseFloat(button.style.top) || area.maxY;
        if (time >= turnAt) {
          const angle = Math.atan2(targetVelocityY, targetVelocityX) + (Math.random() - 0.5) * 0.7;
          const speed = window.innerWidth < 640 ? 43.5 + Math.random() * 13.5 : 73.5 + Math.random() * 25.5;
          targetVelocityX = Math.cos(angle) * speed;
          targetVelocityY = Math.sin(angle) * speed;
          turnAt = time + 2200 + Math.random() * 2100;
        }
        if (x < area.minX + 54 && targetVelocityX < 0) targetVelocityX = Math.abs(targetVelocityX);
        if (x > area.maxX - 54 && targetVelocityX > 0) targetVelocityX = -Math.abs(targetVelocityX);
        if (y < area.minY + 54 && targetVelocityY < 0) targetVelocityY = Math.abs(targetVelocityY);
        if (y > area.maxY - 54 && targetVelocityY > 0) targetVelocityY = -Math.abs(targetVelocityY);
        const steering = 1 - Math.exp(-2.1 * delta);
        velocityX += (targetVelocityX - velocityX) * steering;
        velocityY += (targetVelocityY - velocityY) * steering;
        x = Math.min(area.maxX, Math.max(area.minX, x + velocityX * delta));
        y = Math.min(area.maxY, Math.max(area.minY, y + velocityY * delta));
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        button.dataset.facing = velocityX < 0 ? "left" : "right";
      }
      frameId = window.requestAnimationFrame(animate);
    };

    clampToViewport();
    frameId = window.requestAnimationFrame(animate);
    window.addEventListener("resize", clampToViewport);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", clampToViewport);
    };
  }, []);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const button = buttonRef.current;
    if (!button) return;
    draggedRef.current = false;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: button.offsetLeft, top: button.offsetTop };
    button.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const button = buttonRef.current;
    if (!drag || !button || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) draggedRef.current = true;
    const maxLeft = window.innerWidth - button.offsetWidth - EDGE_GAP;
    const maxTop = window.innerHeight - button.offsetHeight - EDGE_GAP;
    button.style.left = `${Math.min(maxLeft, Math.max(EDGE_GAP, drag.left + deltaX))}px`;
    button.style.top = `${Math.min(maxTop, Math.max(EDGE_GAP, drag.top + deltaY))}px`;
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const button = buttonRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (button?.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        if (draggedRef.current) {
          draggedRef.current = false;
          return;
        }
        onOpen();
      }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => { hoveredRef.current = true; }}
      onPointerLeave={() => { hoveredRef.current = false; }}
      onFocus={() => { hoveredRef.current = true; }}
      onBlur={() => { hoveredRef.current = false; }}
      aria-label="Mở Trợ lý Nấm F1"
      className={styles.robotButton}
    >
      <span className={styles.direction} aria-hidden="true">
        <span className={styles.robotVisual}>
          <span className={styles.aura} />
          <span className={styles.antenna}>
            <span className={styles.antennaLight} />
          </span>
          <span className={styles.head}>
            <span className={`${styles.ear} ${styles.earLeft}`} />
            <span className={`${styles.ear} ${styles.earRight}`} />
            <span className={`${styles.eye} ${styles.eyeLeft}`} />
            <span className={`${styles.eye} ${styles.eyeRight}`} />
            <span className={styles.mouth} />
          </span>
          <span className={styles.body}>
            <span className={styles.core}>F1</span>
            <span className={`${styles.arm} ${styles.armLeft}`} />
            <span className={`${styles.arm} ${styles.armRight}`} />
          </span>
          <span className={`${styles.foot} ${styles.footLeft}`} />
          <span className={`${styles.foot} ${styles.footRight}`} />
          <span className={styles.thruster} />
        </span>
      </span>
      <span className={styles.tooltip}>Hỏi trợ lý F1</span>
    </button>
  );
}
