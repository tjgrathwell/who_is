export const KeyCodes = {
  W: 87,
  A: 65,
  S: 83,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ESC: 27,
  RETURN: 13
};

export function isScrollKey(which) {
  return which == KeyCodes.DOWN || which == KeyCodes.UP;
}

export function personIndexForKey(which) {
  //  0/W    1/^
  //  2/A    3/>
  //  4/S    5/v

  var key_choices = {};
  key_choices[KeyCodes.W] = 0;
  key_choices[KeyCodes.A] = 2;
  key_choices[KeyCodes.S] = 4;
  key_choices[KeyCodes.UP] = 1;
  key_choices[KeyCodes.RIGHT] = 3;
  key_choices[KeyCodes.DOWN] = 5;

  return key_choices[which];
}