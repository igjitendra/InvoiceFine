import { assert, equal } from "./assertions";
import {
  defaultAppearancePreferences,
  fontScaleByPreference,
  isAppearancePreferences,
} from "../types/appearance";

equal(defaultAppearancePreferences.theme, "system");
equal(defaultAppearancePreferences.fontSize, "medium");
equal(defaultAppearancePreferences.compactMode, false);
equal(defaultAppearancePreferences.catalogView, "card");
assert(fontScaleByPreference.small < fontScaleByPreference.medium);
assert(fontScaleByPreference.large > fontScaleByPreference.medium);
assert(
  isAppearancePreferences({
    theme: "dark",
    fontSize: "large",
    compactMode: true,
    catalogView: "list",
  }),
);
assert(
  !isAppearancePreferences({
    theme: "midnight",
    fontSize: "large",
    compactMode: true,
    catalogView: "list",
  }),
);
assert(
  !isAppearancePreferences({
    theme: "light",
    fontSize: "large",
    compactMode: "yes",
    catalogView: "list",
  }),
);
console.log("APPEARANCE_PREFERENCES=PASS");
console.log("LIVE_FONT_SCALE_OPTIONS=PASS");
