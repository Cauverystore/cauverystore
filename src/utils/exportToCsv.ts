export function exportToCSV(data: any[], filename: string) {
  const csv = [
    Object.keys(data[0]).join(","), // headers
    ...data.map((row) => Object.values(row).join(",")),
  ].join("/n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
