import csvToJson from "convert-csv-to-json";
import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let userData: Array<Record<string, string>> = [];

app.use(cors());

app.post("/api/files", upload.single("file"), async (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: "File is required" });
  }

  if (file.mimetype !== "text/csv") {
    return res.status(400).json({ message: "File must be a CSV" });
  }

  let json: Array<Record<string, string>> = [];
  try {
    const rawCsv = Buffer.from(file.buffer).toString("utf-8");
    console.log(rawCsv);
    json = csvToJson.fieldDelimiter(",").csvStringToJson(rawCsv);
  } catch (error) {
    return res.status(500).json({ message: "Error parsing the file" });
  }

  userData = json;
  return res
    .status(200)
    .json({ data: userData, message: "El archivo se cargo correctamente" });
});

app.get("/api/users", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(500).json({ message: "query params `q` is requried" });
  }

  if (Array.isArray(q)) {
    return res.status(500).json({ message: "Q must be a string" });
  }

  const search = q.toString().toLowerCase();

  const filterData = userData.filter((row) => {
    return Object.values(row).some((value) =>
      value.toLowerCase().includes(search)
    );
  });

  return res
    .status(200)
    .json({ data: filterData, message: "El archivo se cargo correctamente" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
