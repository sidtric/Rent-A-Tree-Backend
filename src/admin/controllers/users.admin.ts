import { Response } from 'express';
import User from '../../models/User';
import { AuthRequest } from '../../middleware/auth';

export async function adminGetAllUsers(_req: AuthRequest, res: Response) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('[adminGetAllUsers]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminSearchUsers(req: AuthRequest, res: Response) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'email query param required.' });
    }
    const users = await User.find({
      email: { $regex: String(email), $options: 'i' },
    })
      .select('-password')
      .limit(20);
    res.json(users);
  } catch (err) {
    console.error('[adminSearchUsers]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminUpdateUserRole(req: AuthRequest, res: Response) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be "user" or "admin".' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('[adminUpdateUserRole]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
