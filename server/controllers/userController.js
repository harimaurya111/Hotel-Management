// GET /api/user
export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchedCities = req.user.recentSearchedCities;

    res.status(200).json({ success: true, role, recentSearchedCities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/recent-search
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const user = req.user;
    const { recentSearchedCity } = req.body;

    if (!recentSearchedCity) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    // Maintain max 3 cities
    if (user.recentSearchedCities.length < 3) {
      user.recentSearchedCities.push(recentSearchedCity);
    } else {
      user.recentSearchedCities.shift(); // remove oldest
      user.recentSearchedCities.push(recentSearchedCity);
    }

    await user.save();

    res.status(200).json({ success: true, message: "City added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
