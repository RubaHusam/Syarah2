<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     */
    public function __construct()
    {
        // Middleware is now handled in routes or via attributes
    }

    /**
     * Register a new user and auto-login.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60
        ], 201);
    }

    /**
     * Get a JWT via given credentials.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$token = JWTAuth::attempt($validator->validated())) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        return $this->createNewToken($token);
    }

    /**
     * Get the authenticated User.
     */
    public function userProfile()
    {
        return response()->json([
            'success' => true,
            'user' => JWTAuth::user()
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Refresh a token.
     */
    public function refresh()
    {
        return $this->createNewToken(JWTAuth::refresh(JWTAuth::getToken()));
    }

    /**
     * Get the token array structure.
     */
    protected function createNewToken($token)
    {
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => JWTAuth::user(),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60
        ]);
    }
}
