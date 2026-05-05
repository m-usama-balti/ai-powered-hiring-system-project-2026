// ... existing code ...
const socialLogin = (token) => {
    localStorage.setItem('token', token);
    // You might want to fetch user details here and set them in state
    // For now, we'll just store the token and reload to trigger a re-auth
    window.location.reload();
};

const logoutUser = () => {
    // ... existing code ...
    return (
        <AuthContext.Provider value={{ user, registerUser, loginUser, logoutUser, socialLogin }}>
            {children}
        </AuthContext.Provider>
    );
// ... existing code ...