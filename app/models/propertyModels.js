const connection = require("../../config/db");

const PropertyModel = {
  async addProperty(
    title,
    description,
    price,
    size,
    rooms,
    bathrooms,
    parking,
    property_age,
    user_id,
    category_id,
    listing_type
  ) {
    try {
      const query =
        "INSERT INTO properties (title, description, price, size, rooms, bathrooms, parking, property_age, user_id, category_id, listing_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const result = await connection.execute(query, [
        title,
        description,
        price,
        size,
        rooms,
        bathrooms,
        parking,
        property_age,
        user_id,
        category_id,
        listing_type,
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  },

  async checkForDuplicate(
    title,
    description,
    size,
    rooms,
    bathrooms,
    property_age,
    category_id
  ) {
    try {
      const query =
      "SELECT COUNT(*) AS count FROM properties WHERE title = ? AND description = ? AND size = ? AND rooms = ? AND bathrooms = ? AND property_age = ? AND category_id = ?";
      const [result] = await connection.execute(query, [
        title,
        description,
        size,
        rooms,
        bathrooms,
        property_age,
        category_id,
      ]);

      return result[0].count > 0;
    } catch (error) {
      throw error;
    }
  },

  async getAllProperties() {
    try {
      const query = `
        SELECT 
          title, 
          description, 
          size, 
          rooms, 
          price, 
          parking, 
          listing_type, 
          address, 
          city, 
          pincode, 
          GROUP_CONCAT(property_images.image_name) AS images_name 
        FROM 
          properties 
        INNER JOIN 
          property_locations ON properties.id = property_locations.property_id 
        INNER JOIN 
          property_images ON properties.id = property_images.property_id 
        GROUP BY 
          properties.id`;
      const [result] = await connection.execute(query);

      // Process rows to split image names into arrays
      const processedResult = result.map(result => ({
        ...result,
        images_name: result.images_name.split(',')
      }));

      return processedResult;
    } catch (error) {
      throw error;
    }
  },

  async getPropertyById(property_id) {
    try {
      const query = `
        SELECT 
          title, 
          description, 
          size, 
          rooms, 
          price, 
          parking, 
          listing_type, 
          address, 
          city, 
          pincode, 
          image_name, 
          users.id AS user_id, 
          concat(firstName, ' ', lastName) AS name, 
          email, 
          contactNo 
        FROM 
          properties 
        INNER JOIN 
          property_locations ON properties.id = property_locations.property_id 
        INNER JOIN 
          property_images ON properties.id = property_images.property_id 
        INNER JOIN 
          users ON properties.user_id = users.id 
        WHERE 
          properties.id = ?`;
      const [result] = await connection.execute(query, [property_id]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getPropertiesByUser(userId) {
    try {
      const query = `
        SELECT 
          properties.id,
          properties.title, 
          properties.description, 
          properties.size, 
          properties.rooms, 
          properties.price, 
          properties.parking, 
          properties.listing_type, 
          property_locations.address, 
          property_locations.city, 
          property_locations.pincode,
          GROUP_CONCAT(property_images.image_name) AS images_name
        FROM 
          properties
        INNER JOIN 
          property_locations ON property_locations.property_id = properties.id
        INNER JOIN 
          property_images ON property_images.property_id = properties.id
        WHERE 
          properties.user_id = ?
        GROUP BY
          properties.id
      `;
      const [result] = await connection.execute(query, [userId]);
      
      // Process rows to split image names into arrays
      const processedResult = result.map(result => ({
        ...result,
        images_name: result.images_name.split(',')
      }));
  
      return processedResult;
    } catch (error) {
      throw error;
    }
  },    

  async editProperty(property_id, newData) {
    try {

      const { title, description, price, size, rooms, bathrooms, parking, property_age, user_id, category_id, listing_type, address, pincode } = newData;

      const updatePropertyQuery =
        "UPDATE properties SET title = ?, description = ?, price = ?, size = ?, rooms = ?, bathrooms = ?, parking = ?, property_age = ?, user_id = ?, category_id = ?, listing_type = ? WHERE id = ?";

      await connection.execute(updatePropertyQuery, [ title, description, price, size, rooms, bathrooms, parking, property_age, user_id, category_id, listing_type,property_id]);


      const updateLocationQuery =
        "UPDATE property_locations SET address = ?, pincode = ? WHERE property_id = ?";
      await connection.execute(updateLocationQuery, [ address, pincode, property_id]);

      return { success: true, message: "Property updated successfully." };
    } catch (error) {
      throw error;
    }
  },


  async deleteProperty(property_id) {
    try {
      const deletePropertyQuery = `UPDATE properties SET status = '0' WHERE id = ? AND status = '1'`;
      await connection.execute(deletePropertyQuery, [property_id]);

      const deleteImagesQuery = `UPDATE property_images SET status = '0' WHERE property_id = ? AND status = '1'`;
      await connection.execute(deleteImagesQuery, [property_id]);

      return { success: true, message: "Property deleted successfully." };
    } catch (error) {
      throw error;
    }
  },

  async findProperty(queryParams) {
    try {
      let query = "SELECT * FROM properties WHERE 1";
      const values = [];

      // rent or sell
      if (queryParams.listing_type) {
        query += " AND listing_type = ?";
        values.push(queryParams.listing_type);
      }

      // How many rooms you want? - BHK
      if (queryParams.minRooms && queryParams.maxRooms) {
        query += " AND rooms BETWEEN ? AND ?";
        values.push(queryParams.minRooms, queryParams.maxRooms);
      } else if (queryParams.minRooms) {
        query += " AND rooms >= ?";
        values.push(queryParams.minRooms);
      } else if (queryParams.maxRooms) {
        query += " AND rooms <= ?";
        values.push(queryParams.maxRooms);
      }

      // Price Range
      if (queryParams.minPrice && queryParams.maxPrice) {
        query += " AND price BETWEEN ? AND ?";
        values.push(queryParams.minPrice, queryParams.maxPrice);
      } else if (queryParams.minPrice) {
        query += " AND price >= ?";
        values.push(queryParams.minPrice);
      } else if (queryParams.maxPrice) {
        query += " AND price <= ?";
        values.push(queryParams.maxPrice);
      }

      const result = connection.execute(query, values);
      // console.log(result);
      return result;
      
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  PropertyModel,
};
