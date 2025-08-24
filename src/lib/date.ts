// 'use client';
// const currentDate = new Date();

// // Start of the month
// function startOfMonth(date: Date = currentDate) {
//   return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
// }

// // End of the month
// function endOfMonth(date: Date = currentDate) {
//   return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
// }

// function subMonths(date: Date, amount: number) {
//   const year = date.getFullYear();
//   const month = date.getMonth() - amount;

//   // Handle year change if going into previous year
//   const newDate = new Date(date);
//   newDate.setMonth(month);

//   return newDate;
// }
// function format(date:Date, formatStr: string) {
//   const map = {
//     yyyy: date.getFullYear(),
//     MM: String(date.getMonth() + 1).padStart(2, '0'),
//     dd: String(date.getDate()).padStart(2, '0'),
//     HH: String(date.getHours()).padStart(2, '0'),
//     mm: String(date.getMinutes()).padStart(2, '0'),
//     ss: String(date.getSeconds()).padStart(2, '0'),
//   };

//   return formatStr.replace(/yyyy|MM|dd|HH|mm|ss/g, matched => map[matched]);
// }


// export { startOfMonth, endOfMonth, subMonths ,format };