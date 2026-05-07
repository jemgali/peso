const MANILA_TIME_ZONE = "Asia/Manila";
const d = new Date("2026-05-14T16:00:00.000Z");

console.log("Local getDate():", d.getDate());
console.log("toLocaleString:", d.toLocaleDateString("en-US", { timeZone: MANILA_TIME_ZONE }));
