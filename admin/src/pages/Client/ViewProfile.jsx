import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/api.js';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets.js';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiArrowLeft } from 'react-icons/fi';

const ViewProfile = () => {
  const { user, logout } = useAuth();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: { line1: '', line2: '' },
    gender: '',
    dob: '',
    image: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      let addressLine1 = '';
      let addressLine2 = '';
      if (user.address) {
        if (typeof user.address === 'string') {
          const parts = user.address.split(',');
          addressLine1 = parts[0]?.trim() || '';
          addressLine2 = parts.slice(1).join(',').trim() || '';
        } else if (typeof user.address === 'object') {
          addressLine1 = user.address.line1 || user.address.line2 || '';
          addressLine2 = user.address.line2 || '';
        }
      }

      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          line1: addressLine1,
          line2: addressLine2
        },
        gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '',
        dob: user.birthday ? user.birthday.split('T')[0] : '',
        image: user.profilePicture || ''
      });
      setIsEditMode(false);
      setImagePreview(null);
    }
  }, [user]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setImagePreview(null);
  };

  const handleBackToDashboard = () => {
    window.location.href = '/client-dashboard';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(file);
    toast.info('Image selected for preview');
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUserData(prev => ({ ...prev, phone: val }));
  };

  const handleAddressLine1Change = (e) => {
    setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }));
  };

  const handleAddressLine2Change = (e) => {
    setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }));
  };

  const handleGenderChange = (e) => {
    setUserData(prev => ({ ...prev, gender: e.target.value }));
  };

  const handleDobChange = (e) => {
    setUserData(prev => ({ ...prev, dob: e.target.value }));
  };

  const updateUserProfileData = async () => {
    try {
      setSaving(true);
      
      let profilePictureUrl = userData.image;
      if (imagePreview) {
        const formData = new FormData();
        formData.append('profilePicture', imagePreview);
        const imageResponse = await authAPI.uploadProfilePicture(formData);
        if (imageResponse.data.success) {
          profilePictureUrl = imageResponse.data.user.profilePicture;
        }
      }
      
      const response = await authAPI.updateProfile({
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        gender: userData.gender,
        birthday: userData.dob ? new Date(userData.dob) : null
      });
      
      if (profilePictureUrl !== userData.image) {
        setUserData(prev => ({ ...prev, image: profilePictureUrl }));
      }
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          handleCancel();
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
        <p className="text-gray-600">You need to login to view your profile.</p>
      </div>
    );
  }

  const currentImageSrc = imagePreview ? URL.createObjectURL(imagePreview) : userData.image || assets.kaushalpic;

  return (
    <div className='py-8'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-8">
          <button 
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
        <div className='max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8'>
          
          {/* Profile Image */}
          <div className='flex flex-col items-center mb-2'>
            {isEditMode ? (
              <label htmlFor="profile-image" className="cursor-pointer">
                <div className='inline-block relative'>
                  <img 
                    className='w-36 rounded opacity-75' 
                    src={currentImageSrc} 
                    alt="Profile preview" 
                  />
                  <div className='w-10 h-10 absolute -bottom-2 -right-2 bg-blue-600 rounded-full flex items-center justify-center'>
                    <svg className='w-5 h-5 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input 
                  id="profile-image"
                  onChange={handleImageUpload} 
                  type="file" 
                  hidden 
                  accept="image/*"
                />
              </label>
            ) : (
              <img 
                className='w-36 rounded' 
                src={currentImageSrc} 
                alt="Profile" 
              />
            )}
          </div>

          {/* Name */}
          <div className='flex justify-center'>
            {isEditMode ? (
              <input 
                className='bg-gray-50 text-3xl font-medium max-w-60 mt-4 w-full text-center' 
                type="text" 
                value={userData.name} 
                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
              />
            ) : (
              <p className='font-medium text-3xl text-neutral-800 mt-4 text-center'>{userData.name}</p>
            )}
          </div>

          <hr className='bg-zinc-400 h-[1px] border-none my-4' />

          {/* Contact Information */}
          <div>
            <p className='text-neutral-500 underline mt-3'><FiUser className="inline mr-2" />CONTACT INFORMATION</p>
            <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
              <p className='font-medium'><FiMail className="inline mr-1" />Email id:</p>
              <p className='text-blue-500'>{userData.email}</p>

              <p className='font-medium'><FiPhone className="inline mr-1" />Phone:</p>
              {isEditMode ? (
                <input 
                  className='bg-gray-100 max-w-52' 
                  type="text" 
                  value={userData.phone} 
                  onChange={handlePhoneChange}
                  placeholder="10-digit phone number"
                  maxLength={10}
                />
              ) : (
                <p className='text-blue-400'>{userData.phone || 'Not set'}</p>
              )}

              <p className='font-medium'><FiMapPin className="inline mr-1" />Address:</p>
              {isEditMode ? (
                <div className="w-full space-y-1">
                  <input 
                    className='bg-gray-50 w-full' 
                    onChange={handleAddressLine1Change} 
                    value={userData.address.line1} 
                    type="text" 
                    placeholder="Line 1"
                  />
                  <input 
                    className='bg-gray-50 w-full' 
                    onChange={handleAddressLine2Change} 
                    value={userData.address.line2} 
                    type="text" 
                    placeholder="Line 2"
                  />
                </div>
              ) : (
                <p className='text-gray-500'>
                  {userData.address.line1 || userData.address.line2 ? 
                    <>
                      {userData.address.line1 && <span>{userData.address.line1}</span>}
                      {userData.address.line1 && userData.address.line2 && <br />}
                      {userData.address.line2 && <span>{userData.address.line2}</span>}
                    </>
                    : 'Not set'}
                </p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <p className='text-neutral-500 underline mt-3'><FiCalendar className="inline mr-2" />BASIC INFORMATION</p>
            <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
              <p className='font-medium'>Gender:</p>
              {isEditMode ? (
                <select 
                  className='max-w-24 bg-gray-100' 
                  onChange={handleGenderChange} 
                  value={userData.gender}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className='text-gray-400'>{userData.gender || 'Not set'}</p>
              )}

              <p className='font-medium'>Birthday:</p>
              {isEditMode ? (
                <input 
                  className='max-w-28 bg-gray-100' 
                  type="date" 
                  onChange={handleDobChange}
                  value={userData.dob}
                />
              ) : (
                <p className='text-gray-400'>{userData.dob ? new Date(userData.dob).toLocaleDateString() : 'Not set'}</p>
              )}
            </div>
          </div>

          <hr className='bg-zinc-400 h-[1px] border-none mt-8' />

          {/* Edit / Save Buttons */}
          <div className='mt-10 flex justify-center gap-4 flex-wrap'>
            {isEditMode ? (
              <>
                <button 
                  className='border border-blue-600 text-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50' 
                  onClick={updateUserProfileData}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save information'}
                </button>
                <button 
                  className='border border-gray-500 text-gray-500 px-8 py-2 rounded-full hover:bg-gray-500 hover:text-white transition-all' 
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                className='border border-blue-600 text-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all' 
                onClick={toggleEditMode}
              >
                Edit Profile
              </button>
            )}
          </div>

          <hr className='bg-zinc-400 h-[1px] border-none mt-8' />

          {/* Logout Button */}
          <div className='pt-6 flex justify-center'>
            <button 
              onClick={handleLogout}
              className='text-red-500 hover:text-red-700 text-sm font-medium'
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewProfile;

