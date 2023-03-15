// Assume time is type Date
export const calculateTimeDiffFromNow = (time) => {
  var seconds = Math.floor((new Date() - time) / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "y";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "mo";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "h";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }

  return Math.floor(seconds) + "s";
};

export const displayParticipants = (participants, currentUsername) => {
  let participantsWithoutYou = participants.filter(
    (username) => username !== currentUsername
  );
  if (participants.length === 1) {
    return `Just you :)`;
  } else if (participants.length === 2) {
    // This means just you and one other person
    return `${participantsWithoutYou[0]} and you`;
  } else if (participants.length === 3) {
    return `${participantsWithoutYou[0]}, ${participantsWithoutYou[1]}, and you`;
  } else {
    // This means >3 partipants
    return `${participantsWithoutYou[0]}, ${participantsWithoutYou[1]}, and ${
      participants.length - 2
    } others`;
  }
};
