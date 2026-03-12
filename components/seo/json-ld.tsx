type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown> | null | undefined> | null | undefined;
};

export default function JsonLd({ data }: JsonLdProps) {
  const payloads = Array.isArray(data) ? data.filter(Boolean) : data ? [data] : [];

  return (
    <>
      {payloads.map((payload, index) => (
        <script
          key={index}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
        />
      ))}
    </>
  );
}
