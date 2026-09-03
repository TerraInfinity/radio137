export function Atmosphere({ skin = "none" }: { skin?: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="atmosphere-clockwork">
        <div className="gear gear-a" />
        <div className="gear gear-b" />
        <div className="gear gear-c" />
        <div className="gallifrey gallifrey-a" />
        <div className="gallifrey gallifrey-b" />
        <div className="dial" />
      </div>
      <div className="atmosphere-sand" />
      <div className="sand-grain" />
      {skin === "glaum" ? (
        <>
          <div className="atmosphere-glaum" />
          <div className="atmosphere-glaum-spark" />
          <div className="atmosphere-glaum-shrimp" />
        </>
      ) : null}
      {skin === "waheguru" ? <div className="atmosphere-wahe" /> : null}
      <div className="atmosphere-vignette" />
    </div>
  );
}
