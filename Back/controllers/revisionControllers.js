// En tu controller (por ejemplo revisionController.js)
const getRevisionData = async (req, res) => {
    try {
      const data = await getDataFromDatabase(); // Tu función para obtener datos
      
      // Transformar valor numérico a estrellas
      const transformedData = data.map(item => ({
        ...item,
        stars: '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating)
      }));
      
      res.json(transformedData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };