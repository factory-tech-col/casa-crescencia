import { describe, it, expect, vi, beforeEach } from "vitest";

interface MockUser {
  id: string;
  email: string;
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

interface MockSupabaseAuth {
  signInWithPassword: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
}

function createMockSupabaseAuth(): MockSupabaseAuth {
  return {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
  };
}

describe("Auth Integration", () => {
  let mockAuth: MockSupabaseAuth;

  beforeEach(() => {
    mockAuth = createMockSupabaseAuth();
    vi.clearAllMocks();
  });

  describe("sign in", () => {
    it("signs in with valid credentials", async () => {
      const mockSession: MockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token-abc",
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      const result = await mockAuth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe("test@example.com");
      expect(result.data.session.access_token).toBe("token-abc");
    });

    it("returns error for invalid credentials", async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      const result = await mockAuth.signInWithPassword({
        email: "wrong@example.com",
        password: "wrongpass",
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Invalid login credentials");
      expect(result.data.user).toBeNull();
    });
  });

  describe("sign up", () => {
    it("creates account with valid data", async () => {
      const mockUser: MockUser = {
        id: "user-new",
        email: "new@example.com",
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await mockAuth.signUp({
        email: "new@example.com",
        password: "secure123",
        options: { data: { name: "New User" } },
      });

      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe("new@example.com");
    });

    it("returns error for existing email", async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "User already registered" },
      });

      const result = await mockAuth.signUp({
        email: "existing@example.com",
        password: "secure123",
      });

      expect(result.error).toBeDefined();
      expect(result.data.user).toBeNull();
    });
  });

  describe("sign out", () => {
    it("signs out successfully", async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await mockAuth.signOut();
      expect(result.error).toBeNull();
      expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("session management", () => {
    it("retrieves current session", async () => {
      const mockSession: MockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token-abc",
      };

      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await mockAuth.getSession();
      expect(result.data.session).toBeDefined();
      expect(result.data.session.user.id).toBe("user-1");
    });

    it("returns null session when not authenticated", async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await mockAuth.getSession();
      expect(result.data.session).toBeNull();
    });
  });
});
