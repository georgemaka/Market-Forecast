import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Jobs', href: '/projects', icon: FolderIcon },
  { name: 'Forecasts', href: '/forecasts', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
];

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">
              Sukut Forecasting
            </h1>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                  >
                    <Icon
                      className={`${
                        isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* Logout Button */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon
                  className="mr-3 flex-shrink-0 h-6 w-6 text-red-400 group-hover:text-red-500"
                  aria-hidden="true"
                />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Disclosure as="div" className="lg:hidden">
        {({ open }) => (
          <>
            <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4">
              <h1 className="text-xl font-bold text-gray-900">
                Sukut Forecasting
              </h1>
              <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>

            <Disclosure.Panel className="lg:hidden fixed inset-0 z-30 pt-16">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
              <div className="relative flex flex-col w-64 bg-white h-full shadow-xl">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                  <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Disclosure.Button
                          key={item.name}
                          as={Link}
                          to={item.href}
                          className={`${
                            isActive(item.href)
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        >
                          <Icon
                            className={`${
                              isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                            } mr-4 flex-shrink-0 h-6 w-6`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Disclosure.Button>
                      );
                    })}
                  </nav>
                </div>
                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="group flex w-full items-center px-2 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon
                      className="mr-4 flex-shrink-0 h-6 w-6 text-red-400 group-hover:text-red-500"
                      aria-hidden="true"
                    />
                    Logout
                  </button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;