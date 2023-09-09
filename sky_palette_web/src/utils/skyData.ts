export function parseSkyInfo(skyKeyName: string) {
  // remove .file extension
  const skyName = skyKeyName.replace(/\.[^/.]+$/, "");
  const skyInfo = skyName.split("-");
  const location = skyInfo[0];
  const timeInfo = skyInfo[1];
  const splitLocation = location.split(",");
  const state = splitLocation.pop();
  const city = splitLocation.pop();
  const splitTime = timeInfo.split(" ");
  const time = splitTime.pop();
  const sunStatus = splitTime.pop();
  return {
    state: state,
    time: time,
    city: city,
    sunStatus: sunStatus,
  };
}
