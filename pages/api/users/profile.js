import withAuth from 'src/middleware/auth';
import normalizeEmail from 'validator/lib/normalizeEmail';
import cloudinary from 'src/utils/cloudinary';

const handler = async (req, res) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        res.status(200).json({ success: true, data: req.user });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'PATCH':
      try {
        const { username, email, password, image } = req.body;
        const { user } = req;
        const updates = {
          ...(username && { username }),
          ...(email && { email: normalizeEmail(email) }),
          ...(password && { password }),
        };

        if (image) {
          const uploadedImage = await cloudinary.uploader.upload(image, {
            width: 120,
            height: 120,
            crop: 'fill',
            public_id: user._id,
            folder: 'a-note',
            format: 'jpg',
          });

          updates.profileImage = uploadedImage.secure_url;
        }

        Object.keys(updates).forEach((update) => {
          user[update] = updates[update];
        });

        await user.save();
        res.status(200).json({ success: true, data: user });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        await req.user.remove();
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
};

export default withAuth(handler);
