import Image from "next/image";

const frames = [
  "/mood/rain-window.jpg",
  "/mood/cafe-focus.jpg",
  "/mood/rainy-street.jpg",
  "/mood/quiet-cafe.jpg",
  "/mood/studio-light.jpg",
];

export default function AtmosphereFrame({ today }: { today: string }) {
  const dayNumber = Math.floor(new Date(`${today}T12:00:00`).getTime() / 86_400_000);
  const src = frames[Math.abs(dayNumber) % frames.length];

  return <figure className="atmosphereFrame" aria-hidden="true">
    <Image src={src} alt="" fill sizes="100vw" priority />
  </figure>;
}
