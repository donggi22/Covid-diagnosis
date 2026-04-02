const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, hospital, department, licenseNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: '필수 입력값이 누락되었습니다.' });
    }

    // 이메일을 소문자로 변환 (User 모델에서 lowercase: true 설정되어 있지만, 명시적으로 처리)
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: '이미 등록된 이메일입니다.' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      hospital,
      department,
      licenseNumber,
    });

    const token = createToken(user);

    console.log(`회원가입 성공: ${user.email} (${user.name})`);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    // 이메일을 소문자로 변환하여 검색 (User 모델에서 lowercase: true 설정되어 있음)
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`로그인 실패: 사용자를 찾을 수 없음 (이메일: ${normalizedEmail})`);
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log(`로그인 실패: 비밀번호 불일치 (이메일: ${normalizedEmail})`);
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = createToken(user);

    console.log(`로그인 성공: ${user.email} (${user.name})`);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return res.status(500).json({ error: '사용자 정보를 가져올 수 없습니다.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, hospital, department, licenseNumber } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 업데이트할 필드만 수정
    if (name) user.name = name;
    if (hospital !== undefined) user.hospital = hospital;
    if (department !== undefined) user.department = department;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;

    await user.save();

    return res.json({
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hospital: user.hospital,
        department: user.department,
        licenseNumber: user.licenseNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return res.status(500).json({ error: '프로필 업데이트 중 오류가 발생했습니다.' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '새 비밀번호는 6자 이상이어야 합니다.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: '이미지 파일을 업로드해주세요.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 이미지 경로를 Base64로 저장 (간단한 구현)
    const imageUrl = `/uploads/${req.file.filename}`;
    user.profileImage = imageUrl;

    await user.save();

    return res.json({
      message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
      profileImage: imageUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hospital: user.hospital,
        department: user.department,
        licenseNumber: user.licenseNumber,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('프로필 이미지 업데이트 오류:', error);
    return res.status(500).json({ error: '프로필 이미지 업데이트 중 오류가 발생했습니다.' });
  }
};
