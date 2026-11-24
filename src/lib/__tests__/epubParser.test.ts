// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { parseEpubFile } from "../epub/epubParser";

async function buildSampleEpub(): Promise<Blob> {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip");
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
    </container>`
  );
  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="utf-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>El Libro de Prueba</dc:title>
        <dc:creator>Autor Ejemplo</dc:creator>
        <dc:language>es</dc:language>
      </metadata>
      <manifest>
        <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
      </manifest>
      <spine><itemref idref="ch1"/></spine>
    </package>`
  );
  zip.file(
    "OEBPS/ch1.xhtml",
    `<?xml version="1.0" encoding="utf-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml">
      <body>
        <h1>Capítulo Uno</h1>
        <p>Buenos días, el cielo está despejado hoy.</p>
        <p>Vamos a leer un libro en español.</p>
      </body>
    </html>`
  );
  return zip.generateAsync({ type: "blob" });
}

describe("parseEpubFile", () => {
  it("extracts metadata, language, and chapter paragraphs from an .epub archive", async () => {
    const blob = await buildSampleEpub();
    const book = await parseEpubFile(blob, "prueba.epub");
    expect(book.title).toBe("El Libro de Prueba");
    expect(book.author).toBe("Autor Ejemplo");
    expect(book.language).toBe("es");
    expect(book.chapters).toHaveLength(1);
    expect(book.chapters[0].title).toBe("Capítulo Uno");
    expect(book.chapters[0].paragraphs).toEqual([
      "Capítulo Uno",
      "Buenos días, el cielo está despejado hoy.",
      "Vamos a leer un libro en español.",
    ]);
  });

  it("handles XHTML chapters with self-closing <title/> (FB2EPUB Russian style)", async () => {
    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip");
    zip.file(
      "META-INF/container.xml",
      `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`
    );
    zip.file(
      "OPS/content.opf",
      `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Гарри Поттер</dc:title><dc:creator>Джоан Роулинг</dc:creator><dc:language>ru</dc:language></metadata><manifest><item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="ch1"/></spine></package>`
    );
    zip.file(
      "OPS/ch1.xhtml",
      `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title/></head><body><p>Глава 1</p><p>В доме № 4 по Тисовой улице.</p></body></html>`
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const book = await parseEpubFile(blob, "hp_ru.epub");
    expect(book.language).toBe("ru");
    expect(book.chapters).toHaveLength(1);
    expect(book.chapters[0].paragraphs).toEqual(["Глава 1", "В доме № 4 по Тисовой улице."]);
  });
});
