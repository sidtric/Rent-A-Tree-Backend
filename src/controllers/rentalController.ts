import { Response } from 'express';
import Rental from '../models/Rental';
import { AuthRequest } from '../middleware/auth';

export async function createRental(req: AuthRequest, res: Response) {
  try {
    const { plan, variety, season, deliveryAddress, razorpayOrderId, paymentId } = req.body;
    if (!plan || !variety || !deliveryAddress) {
      return res.status(400).json({ message: 'plan, variety, and deliveryAddress are required.' });
    }
    const rental = await Rental.create({
      user: req.user!._id,
      plan,
      variety,
      season: season || String(new Date().getFullYear()),
      deliveryAddress,
      razorpayOrderId,
      paymentId,
      status: 'active',
    });
    res.status(201).json(rental);
  } catch (err) {
    console.error('[createRental]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getMyRentals(req: AuthRequest, res: Response) {
  try {
    const rentals = await Rental.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error('[getMyRentals]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function cancelRental(req: AuthRequest, res: Response) {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, user: req.user!._id });
    if (!rental) return res.status(404).json({ message: 'Rental not found.' });
    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Only active rentals can be cancelled.' });
    }
    rental.status = 'cancelled';
    await rental.save();
    res.json(rental);
  } catch (err) {
    console.error('[cancelRental]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
