"use client";

import { useEffect, useRef } from "react";
import styles from "./roaming-chat-robot.module.css";

interface RoamingChatRobotProps {
  onOpen: () => void;
}

const ROBOT_SIZE = 56;
const EDGE_GAP = 14;
const TOP_SAFE_GAP = 88;

export function RoamingChatRobot({ onOpen }: RoamingChatRobotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const robotButton: HTMLButtonElement = button;

    const desktopInset = window.matchMedia("(min-width: 640px)");
    let frameId = 0;
    let previousTime = 0;
    let turnAt = 0;
    let initialized = false;
    let x = 0;
    let y = 0;
    let velocityX = -78;
    let velocityY = -48;
    let targetVelocityX = velocityX;
    let targetVelocityY = velocityY;
    let facing: "left" | "right" = "left";

    function bounds() {
      return {
        minX: EDGE_GAP,
        minY: Math.min(TOP_SAFE_GAP, Math.max(EDGE_GAP, window.innerHeight - ROBOT_SIZE)),
        maxX: Math.max(EDGE_GAP, window.innerWidth - ROBOT_SIZE - EDGE_GAP),
        maxY: Math.max(TOP_SAFE_GAP, window.innerHeight - ROBOT_SIZE - EDGE_GAP),
      };
    }

    function basePosition() {
      const inset = desktopInset.matches ? 24 : 16;
      return {
        x: window.innerWidth - ROBOT_SIZE - inset,
        y: window.innerHeight - ROBOT_SIZE - inset,
      };
    }

    function renderPosition() {
      const base = basePosition();
      robotButton.style.transform = `translate3d(${(x - base.x).toFixed(2)}px, ${(y - base.y).toFixed(2)}px, 0)`;
      if (velocityX < -6) facing = "left";
      if (velocityX > 6) facing = "right";
      robotButton.dataset.facing = facing;
    }

    function initializePosition() {
      const area = bounds();
      const base = basePosition();
      x = Math.min(area.maxX, Math.max(area.minX, base.x));
      y = Math.min(area.maxY, Math.max(area.minY, base.y));
      initialized = true;
      renderPosition();
    }

    function clampToViewport() {
      if (!initialized) return;
      const area = bounds();
      x = Math.min(area.maxX, Math.max(area.minX, x));
      y = Math.min(area.maxY, Math.max(area.minY, y));
      renderPosition();
    }

    function animate(time: number) {
      if (!initialized) initializePosition();

      robotButton.dataset.moving = pausedRef.current ? "false" : "true";
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0;
      previousTime = time;

      if (!pausedRef.current && document.visibilityState === "visible") {
        if (time >= turnAt) {
          const currentAngle = Math.atan2(targetVelocityY, targetVelocityX);
          const nextAngle = currentAngle + (Math.random() - 0.5) * 0.85;
          const speed = window.innerWidth < 640 ? 46 + Math.random() * 12 : 64 + Math.random() * 18;
          targetVelocityX = Math.cos(nextAngle) * speed;
          targetVelocityY = Math.sin(nextAngle) * speed;
          turnAt = time + 4200 + Math.random() * 2800;
        }

        const area = bounds();
        const horizontalTurnZone = Math.min(72, (area.maxX - area.minX) * 0.18);
        const verticalTurnZone = Math.min(72, (area.maxY - area.minY) * 0.18);

        if (x < area.minX + horizontalTurnZone && targetVelocityX < 0) targetVelocityX = Math.abs(targetVelocityX);
        if (x > area.maxX - horizontalTurnZone && targetVelocityX > 0) targetVelocityX = -Math.abs(targetVelocityX);
        if (y < area.minY + verticalTurnZone && targetVelocityY < 0) targetVelocityY = Math.abs(targetVelocityY);
        if (y > area.maxY - verticalTurnZone && targetVelocityY > 0) targetVelocityY = -Math.abs(targetVelocityY);

        const steering = 1 - Math.exp(-2.15 * delta);
        velocityX += (targetVelocityX - velocityX) * steering;
        velocityY += (targetVelocityY - velocityY) * steering;
        x += velocityX * delta;
        y += velocityY * delta;

        if (x <= area.minX || x >= area.maxX) {
          x = Math.min(area.maxX, Math.max(area.minX, x));
          velocityX = (x <= area.minX ? 1 : -1) * Math.abs(velocityX) * 0.55;
          targetVelocityX = (x <= area.minX ? 1 : -1) * Math.abs(targetVelocityX);
        }
        if (y <= area.minY || y >= area.maxY) {
          y = Math.min(area.maxY, Math.max(area.minY, y));
          velocityY = (y <= area.minY ? 1 : -1) * Math.abs(velocityY) * 0.55;
          targetVelocityY = (y <= area.minY ? 1 : -1) * Math.abs(targetVelocityY);
        }
      }

      renderPosition();
      frameId = window.requestAnimationFrame(animate);
    }

    initializePosition();
    frameId = window.requestAnimationFrame(animate);
    window.addEventListener("resize", clampToViewport);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", clampToViewport);
    };
  }, []);

  function pause() {
    pausedRef.current = true;
  }

  function resume() {
    pausedRef.current = false;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onOpen}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onPointerDown={pause}
      onFocus={pause}
      onBlur={resume}
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
