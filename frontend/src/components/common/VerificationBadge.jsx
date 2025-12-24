const VerificationBadge = ({ seller, size = 'sm', showLabel = false }) => {
  if (!seller?.sellerProfile?.isVerified) {
    return null;
  }

  const verificationLevel = seller.sellerProfile.verificationLevel || 'basic';

  const badgeConfig = {
    basic: {
      icon: '✓',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      label: 'Verified Seller',
      tooltip: 'This seller has been verified by our team'
    },
    trusted: {
      icon: '✓✓',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      label: 'Trusted Seller',
      tooltip: 'Highly rated seller with excellent track record'
    },
    premium: {
      icon: '★',
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-600',
      label: 'Premium Seller',
      tooltip: 'Top-tier seller with outstanding reputation'
    }
  };

  const config = badgeConfig[verificationLevel] || badgeConfig.basic;

  const sizeClasses = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-xs',
    lg: 'w-7 h-7 text-sm',
    xl: 'w-8 h-8 text-base'
  };

  if (showLabel) {
    return (
      <div className="flex items-center gap-1" title={config.tooltip}>
        <div
          className={`${sizeClasses[size]} ${config.color} text-white rounded-full flex items-center justify-center font-bold shadow-sm`}
        >
          {config.icon}
        </div>
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${config.color} text-white rounded-full flex items-center justify-center font-bold shadow-sm`}
      title={config.tooltip}
    >
      {config.icon}
    </div>
  );
};

export default VerificationBadge;
