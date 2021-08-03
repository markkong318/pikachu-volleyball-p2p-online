export function getPartyId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('partyId');
}

export function isHost() {
  return !getPartyId();
}

export function setParty() {
  const partyId = getPartyId();

  if (partyId) {
    const joinRoomIdInput = document.getElementById('join-room-id-input');
    joinRoomIdInput.value = partyId;

    const joinBtn = document.getElementById('join-btn');
    joinBtn.click();

    return;
  }

  const withYourFriendBtn = document.getElementById('with-your-friend-btn');
  withYourFriendBtn.click();
  const createBtn = document.getElementById('create-btn');
  createBtn.click();
}
