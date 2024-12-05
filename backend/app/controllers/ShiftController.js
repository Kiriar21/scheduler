const Shift = require('../db/models/Shift');
const { validateShiftHours } = require('../utils/validation');

const defaultShift = () => {
  return {
    start_shift: 0,
    end_shift: 23,
  };
};

//Pobieranie info o zmianie
const getInfoShift = async (req, res) => {
  try {
    const shiftId = req.params.shiftId;

    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({ error: 'Shift nie został znaleziony' });
    }

    return res.status(200).json({ shift });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

//Edycja informacji w zmianie
const editShift = async (req, res) => {
  try {
    const shiftId = req.params.shiftId;
    let { start_shift, end_shift } = req.body;

    start_shift = parseInt(start_shift);
    end_shift = parseInt(end_shift);

    if (!validateShiftHours(start_shift, end_shift)) {
      return res.status(400).json({ error: 'Różnica między start_shift a end_shift musi być co najmniej 8 godzin' });
    }

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      { start_shift, end_shift },
      { new: true }
    );

    return res.status(200).json({ message: 'Shift został zaktualizowany', shift: updatedShift });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  defaultShift,
  getInfoShift,
  editShift,
};
