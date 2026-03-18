import React, { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    isDestructive = false
}) => {
    const cancelButtonRef = useRef(null);

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" initialFocus={cancelButtonRef} onClose={onCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100 p-6">
                                <div className="sm:flex sm:items-start">
                                    <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-black text-white'}`}>
                                        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2 text-sm text-gray-500">
                                            {description}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                                    <button
                                        type="button"
                                        className={`w-full inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto ${
                                            isDestructive 
                                                ? 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600' 
                                                : 'bg-black text-white hover:bg-gray-800 focus-visible:outline-black'
                                        }`}
                                        onClick={onConfirm}
                                    >
                                        {confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                                        onClick={onCancel}
                                        ref={cancelButtonRef}
                                    >
                                        {cancelText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};
