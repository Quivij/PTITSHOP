export const useAuth = () => {
    let role: "client" | "user" | "admin" = "client";
    const storedIsAdmin = localStorage.getItem("isAdmin");
    if (storedIsAdmin !== null) {
        role = storedIsAdmin === "1" ? "admin" : "user";
    }
    console.log("Role: "+ role);
    return { role };
};

