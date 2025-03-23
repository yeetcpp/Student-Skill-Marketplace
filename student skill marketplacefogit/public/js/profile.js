// public/js/profile.js

// Description editing
const editDescriptionBtn = document.getElementById('edit-description-btn');
const saveDescriptionBtn = document.getElementById('save-description-btn');
const descriptionText = document.getElementById('description-text');
const descriptionInput = document.getElementById('description-input');

editDescriptionBtn.addEventListener('click', () => {
    descriptionText.style.display = 'none';
    editDescriptionBtn.style.display = 'none';
    descriptionInput.style.display = 'block';
    saveDescriptionBtn.style.display = 'inline-block';
    descriptionInput.focus();
});

saveDescriptionBtn.addEventListener('click', async () => {
    const newDescription = descriptionInput.value;

    try {
        const response = await fetch('/profile/update-description', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: newDescription }),
        });

        const result = await response.json();

        if (result.success) {
            descriptionText.textContent = newDescription || 'No description yet.';
            descriptionText.style.display = 'block';
            editDescriptionBtn.style.display = 'inline-block';
            descriptionInput.style.display = 'none';
            saveDescriptionBtn.style.display = 'none';
        } else {
            alert('Failed to update description');
        }
    } catch (error) {
        console.error('Error updating description:', error);
        alert('Error updating description');
    }
});

// Image uploading (profile picture and banner)
const editProfilePicBtn = document.querySelector('.edit-profile-pic-btn');
const profilePicInput = document.getElementById('profile-pic-input');
const editBannerBtn = document.querySelector('.edit-banner-btn');
const bannerInput = document.getElementById('banner-input');

editProfilePicBtn.addEventListener('click', () => {
    profilePicInput.click();
});

editBannerBtn.addEventListener('click', () => {
    bannerInput.click();
});

async function uploadImage(input, imageType) {
    const file = input.files[0];
    if (!file) return;

    // Convert the image to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const imageData = reader.result;

        try {
            const response = await fetch('/profile/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageType, imageData }),
            });

            const result = await response.json();

            if (result.success) {
                // Update the image on the page
                if (imageType === 'profile_picture') {
                    document.querySelector('.profile-picture').style.background = `url('${result.imageUrl}') center/cover`;
                    document.querySelector('.avatar').style.background = `url('${result.imageUrl}') center/cover`;
                } else {
                    document.querySelector('.banner').style.background = `url('${result.imageUrl}') center/cover`;
                }
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        }
    };
}

profilePicInput.addEventListener('change', () => uploadImage(profilePicInput, 'profile_picture'));
bannerInput.addEventListener('change', () => uploadImage(bannerInput, 'banner'));

// Sidebar menu functionality (similar to index page)
const menuItems = document.querySelectorAll('.sidebar nav ul li');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        item.classList.add('clicked');
        
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
});

hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});