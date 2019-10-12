import axios from "axios";

export const downloadExcel = () => {
  window.location.href = "/downloadExcel";
};

export const uploadExcel = () => {
  const uploadFunction = event => {
    const data = new FormData();
    data.append("excelFile", event.target.files[0]);
    axios
      .post("/importExcel", data)
      .then(() => window.alert("Successfully imported Excel file."))
      .catch(() => window.alert("Error uploading Excel file."));
  };
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xls";
  input.onchange = uploadFunction;
  input.click();
};

export const uploadExcelTemplate = () => {
  const uploadFunction = event => {
    const data = new FormData();
    data.append("templateFile", event.target.files[0]);
    axios
      .post("/importTemplate", data)
      .then(() => window.alert("Successfully imported Excel template."))
      .catch(() => window.alert("Error uploading Excel template."));
  };
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xls";
  input.onchange = uploadFunction;
  input.click();
};
