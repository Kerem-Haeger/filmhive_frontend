function CastCrewSection({ castOrPeople }) {
  const director = castOrPeople.find((p) => {
    const job = (p.job || p.role || "").toLowerCase();
    return job === "director";
  });

  const mainCast = castOrPeople
    .filter((p) => {
      const name = p && (p.name || p.person_name);
      if (!name) return false;
      if (director && (director.name || director.person_name) === name) return false;
      return true;
    })
    .slice(0, 6);

  if (!director && mainCast.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <h2 className="h4 fh-section-title">Cast &amp; crew</h2>

      {director && (
        <p className="mb-1">
          <strong>Director:</strong> {director.name || director.person_name}
        </p>
      )}

      {mainCast.length > 0 && (
        <p className="mb-0">
          <strong>Cast:</strong>{" "}
          {mainCast
            .map((p) => p.name || p.person_name)
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </div>
  );
}

export default CastCrewSection;
