
import axios from "axios";

const api = axios.create({
  baseURL: "https://namaste-backend-jpmi.onrender.com", 
  timeout: 10000,
});


export async function searchTerms(q, limit = 12) {
  const res = await api.get("/search", { params: { q, limit } });
  return res.data.matches || [];
}


  export async function translateValueCoding(valueCoding) {
    // Wrap valueCoding inside 'parameter' array with valueCoding key
    const params = { resourceType: "Parameters", parameter: [{ valueCoding }] };
    const res = await api.post("/$translate", params);
    return res.data;
  }
  
  

export async function uploadBundle(bundle) {
  const res = await api.post("/fhir/Bundle", bundle);
  return res.data;
}

export default api;
