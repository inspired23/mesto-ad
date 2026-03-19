export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (

  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick, userId }
) => {
  
  if (data.owner && data.owner._id !== userId) {
    deleteButton.remove();
  }

  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  likeCount.textContent = data.likes.length;

  const isLiked = data.likes.some((user) => user._id === userId);

  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (infoButton && onInfoClick) {
  infoButton.addEventListener("click", () => {
    onInfoClick(data._id);
  });
}

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      onLikeIcon(data._id, likeButton, likeCount);
    });
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};