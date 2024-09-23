'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    return (
        <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
            <div className="text-2xl font-bold">Your App Name</div>
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: 'w-10 h-10'
                            }
                        }}
                    />
                </SignedIn>
            </div>
        </header>
    );
}