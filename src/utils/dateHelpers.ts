export const calculateDueDate = (days: number): Date => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
};

export const isOverdue = (dueDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
};
