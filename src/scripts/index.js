// файл index.js
import { enableValidation, clearValidation } from "./components/validation.js";

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardApi,
  changeLikeCardStatus,
} from "./components/api.js";

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings);

import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoList = cardInfoModalWindow.querySelector(".popup__info-list");
const usersList = cardInfoModalWindow.querySelector(".popup__users-list");

const infoTemplate = document.querySelector("#popup-info-definition-template").content;
const userTemplate = document.querySelector("#popup-info-user-preview-template").content;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeClick = (cardId, likeButton, likeCount) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeCount.textContent = updatedCard.likes.length;

      likeButton.classList.toggle("card__like-button_is-active");
    })
    .catch(console.log);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(console.log);
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(console.log);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((card) => {
      placesWrap.prepend(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeClick,
          onInfoClick: handleInfoClick,
          onDeleteCard: (cardElement) => {
            deleteCardApi(card._id)
              .then(() => cardElement.remove())
              .catch(console.log);
          },
          userId,
        })
      );

      closeModalWindow(cardFormModalWindow);
    })
    .catch(console.log);
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (title, value) => {
  const element = infoTemplate.cloneNode(true);
  element.querySelector(".popup__info-title").textContent = title;
  element.querySelector(".popup__info-value").textContent = value;
  return element;
};

const createUserItem = (name) => {
  const element = userTemplate.cloneNode(true);
  element.querySelector(".popup__user-name").textContent = name;
  return element;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      cardInfoList.innerHTML = "";
      usersList.innerHTML = "";

      cardInfoList.append(
        createInfoString("Описание:", cardData.name)
      );

      cardInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );

      cardInfoList.append(
        createInfoString("Владелец:", cardData.owner.name)
      );

      cardInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      cardData.likes.forEach((user) => {
        usersList.append(createUserItem(user.name));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch(console.log);
};

initialCards.forEach((data) => {
  placesWrap.append(
    createCardElement(data, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: handleLikeClick,
      onInfoClick: handleInfoClick,
      onDeleteCard: deleteCard,
    })
  );
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

let userId;

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    userId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeClick,
          onInfoClick: handleInfoClick,
          onDeleteCard: (cardElement) => {
            deleteCardApi(card._id)
              .then(() => {
                cardElement.remove();
              })
              .catch(console.log);
          },
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
