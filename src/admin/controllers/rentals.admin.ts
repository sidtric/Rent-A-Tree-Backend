import { Response } from 'express';
import Rental from '../../models/Rental';
import { AuthRequest } from '../../middleware/auth';

const VALID_STATUSES = ['pending_payment', 'active', 'completed', 'cancelled'];

export async function adminGetAllRentals(_req: AuthRequest, res: Response) {
  try {
    const rentals = await Rental.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error('[adminGetAllRentals]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminUpdateRentalStatus(req: AuthRequest, res: Response) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    if (!rental) return res.status(404).json({ message: 'Rental not found.' });
    res.json(rental);
  } catch (err) {
    console.error('[adminUpdateRentalStatus]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
