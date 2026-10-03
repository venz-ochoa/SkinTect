//the body areas a scan can be tagged with
//keep the ids in sync with BODY_LOCATIONS in server.js, the server rejects anything not on that list
//left and right always mean the person's OWN left and right

export const BODY_LOCATIONS = [
  { id: "head", label: "Head" },
  { id: "neck", label: "Neck" },
  { id: "chest", label: "Chest" },
  { id: "abdomen", label: "Abdomen" },
  { id: "pelvis", label: "Pelvis" },
  { id: "upper_back", label: "Upper back" },
  { id: "lower_back", label: "Lower back" },
  { id: "buttocks", label: "Buttocks" },
  { id: "left_upper_arm", label: "Left upper arm" },
  { id: "right_upper_arm", label: "Right upper arm" },
  { id: "left_forearm", label: "Left forearm" },
  { id: "right_forearm", label: "Right forearm" },
  { id: "left_hand", label: "Left hand" },
  { id: "right_hand", label: "Right hand" },
  { id: "left_thigh", label: "Left thigh" },
  { id: "right_thigh", label: "Right thigh" },
  { id: "left_lower_leg", label: "Left lower leg" },
  { id: "right_lower_leg", label: "Right lower leg" },
  { id: "left_foot", label: "Left foot" },
  { id: "right_foot", label: "Right foot" },
  { id: "other", label: "Other" },
];

//turns an id like "left_forearm" into "Left forearm"
//scans with no area (and the "untagged" bucket the trends route sends back) read as "Not tagged"
export function locationLabel(id) {
  if (!id || id === "untagged") return "Not tagged";
  return BODY_LOCATIONS.find((l) => l.id === id)?.label ?? "Other";
}
