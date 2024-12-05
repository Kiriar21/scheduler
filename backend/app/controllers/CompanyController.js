const Company = require('../db/models/Company');
const {
  validateNIP,
  validateName,
} = require('../utils/validation');

//Rejestracja firmy
const registerCompany = async (companyData) => {
  try {
    let { nip, name, admin } = companyData;

    if (!validateNIP(nip)) {
      throw new Error('Nieprawidłowy format NIP');
    }

    if (!validateName(name)) {
      throw new Error('Nazwa firmy musi mieć co najmniej 3 znaki');
    }

    const existingCompany = await Company.findOne({ nip });
    if (existingCompany) {
      throw new Error('Firma z tym NIP już istnieje');
    }

    const newCompany = new Company({
      nip,
      name,
      admin,
      users: [admin],
    });

    const savedCompany = await newCompany.save();

    return savedCompany;
  } catch (error) {
    throw error;
  }
};

//Pobieranie danych firmy
const getInfoCompany = async (req, res) => {
  try {
    console.log(req.user)
    const company = await Company.findById(req.user.company).select('nip name');

    return res.status(200).json({ company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

//Edycja danych firmy
const editInfoCompany = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { nip, name } = req.body;

    if (!validateNIP(nip)) {
      return res.status(400).json({ error: 'Nieprawidłowy format NIP' });
    }

    if (!validateName(name)) {
      return res.status(400).json({ error: 'Nazwa firmy musi mieć co najmniej 3 znaki' });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.user.company,
      { nip, name },
      { new: true }
    );

    return res.status(200).json({ message: 'Informacje o firmie zostały zaktualizowane', company: updatedCompany });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  registerCompany,
  getInfoCompany,
  editInfoCompany,
};
