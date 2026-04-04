"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticleCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvas = document.createElement("canvas");
    canvas.id = "bg-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";
    mountRef.current.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // ── PARTICLE SYSTEM ──
    const count = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;
      pos[i3 + 1] = (Math.random() - 0.5) * 20;
      pos[i3 + 2] = (Math.random() - 0.5) * 20;

      const t = Math.random();
      if (t < 0.7) {
        // baby blue #7dd3fc
        col[i3] = 125 / 255;
        col[i3 + 1] = 211 / 255;
        col[i3 + 2] = 252 / 255;
      } else {
        // green #6ee7b7
        col[i3] = 110 / 255;
        col[i3 + 1] = 231 / 255;
        col[i3 + 2] = 183 / 255;
      }
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // ── GRID LINES ──
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.04,
    });
    for (let i = -5; i <= 5; i++) {
      const geoH = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10, i * 2, -8),
        new THREE.Vector3(10, i * 2, -8),
      ]);
      const geoV = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * 2, -10, -8),
        new THREE.Vector3(i * 2, 10, -8),
      ]);
      scene.add(new THREE.Line(geoH, gridMat));
      scene.add(new THREE.Line(geoV, gridMat));
    }

    // ── FLOATING RINGS ──
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const rGeo = new THREE.TorusGeometry(1.5 + i * 0.8, 0.003, 8, 80);
      const rMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x7dd3fc : 0x6ee7b7,
        transparent: true,
        opacity: 0.06 + i * 0.02,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.PI / 2 + i * 0.3;
      ring.rotation.y = i * 0.5;
      ring.position.z = -3;
      scene.add(ring);
      rings.push(ring);
    }

    // ── MOUSE PARALLAX ──
    let mx = 0,
      my = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener("mousemove", handleMouseMove);

    // ── ANIMATE ──
    let t = 0;
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      t += 0.004;

      particles.rotation.y = t * 0.05 + mx * 0.05;
      particles.rotation.x = t * 0.02 + my * 0.03;

      rings.forEach((r, i) => {
        r.rotation.z = t * (0.1 + i * 0.05);
        r.rotation.y = t * (0.08 - i * 0.02);
      });

      // pulsing opacity
      mat.opacity = 0.4 + Math.sin(t) * 0.2;

      camera.position.x += (mx * 0.3 - camera.position.x) * 0.05;
      camera.position.y += (my * 0.2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouseMove);
      if (mountRef.current?.contains(canvas)) {
        mountRef.current.removeChild(canvas);
      }
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
}
