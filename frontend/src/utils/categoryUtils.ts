export const getCategoryNameFromSlug = (slug: string) => {
    // Tách theo dấu gạch ngang
    const parts = slug.split("-");
    // Bỏ cái id cuối cùng
    parts.pop();
    // Ghép lại thành tên
    return parts.join(" ");
  };