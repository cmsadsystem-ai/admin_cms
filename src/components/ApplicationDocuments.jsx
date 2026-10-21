export default function ApplicationDocuments({ documents = {}, signature }) {
  const uploadedDocuments = Object.entries(documents).filter(([, file]) => file?.dataUrl);
  const uploadedSignature = signature && typeof signature === 'object' && signature.dataUrl ? signature : null;

  if (!uploadedDocuments.length && !uploadedSignature) return null;

  const files = [
    ...uploadedDocuments.map(([key, file]) => ({ key, label: key, file })),
    ...(uploadedSignature ? [{ key: 'signature', label: 'Student signature', file: uploadedSignature }] : []),
  ];

  return (
    <section className="document-review-block">
      <h3>Uploaded documents</h3>
      <div className="document-review-grid">
        {files.map(({ key, label, file }) => (
          <article className="document-review-item" key={key}>
            <strong>{label}</strong>
            <p className="document-name">{file.name}</p>
            {file.mimeType === 'application/pdf' ? (
              <>
                <iframe className="document-pdf-preview" src={file.dataUrl} title={`${label} preview`} />
                <a className="document-open-link" href={file.dataUrl} target="_blank" rel="noreferrer">Open PDF in a new tab</a>
              </>
            ) : (
              <img
                className="document-review-image"
                src={file.dataUrl}
                alt={`${label} preview`}
                style={{ transform: `rotate(${Number(file.rotation || 0)}deg)` }}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
