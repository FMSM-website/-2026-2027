export default async function handler(req, res) {
  // السماح بالاتصال من أي مكان لمنع مشاكل CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // الحصول على المسار المطلوب من رابط الموقع (مثال: applications)
  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  // قاعدة بياناتك الرسمية الحقيقية
  const DB_URL = "https://university-master-portal-default-rtdb.firebaseio.com";
  const url = `${DB_URL}/${path}.json`;

  try {
    const options = {
      method: req.method,
      headers: {},
    };

    if (req.method !== 'GET') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
