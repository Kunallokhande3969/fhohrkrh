// स्टूडेंट से संबंधित सभी लॉजिक अलग फाइल में
exports.currentStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  // अपडेट लॉजिक यहाँ
};