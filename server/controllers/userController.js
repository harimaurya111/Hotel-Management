
//Get /api/user
export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    console.log(role)
    const recentSearchedCities = req.user.recentSearchedCities;
    res.json({ success: true, role, recentSearchedCities });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Store User Recent Search Cities
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const user = req.user;
    const { recentSearchedCity } = req.body;

    if (user.recentSearchedCities.length < 3) {
      user.recentSearchedCities.push(recentSearchedCity);
    } else {
      user.recentSearchedCities.shift();
      user.recentSearchedCities.push(recentSearchedCity);
    }

    await user.save();

    res.json({ success: true, message: "City Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

