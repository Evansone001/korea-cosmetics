import React from 'react';
import { Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface RegulatoryData {
  korea_mfds?: string;
  functional_certification?: string;
  clinical_test_results?: string;
  patented_ingredients?: string;
  other_regulatory?: string;
}

interface ProductRegulatoryProps {
  regulatory?: RegulatoryData;
  compact?: boolean;
}

const ProductRegulatory: React.FC<ProductRegulatoryProps> = ({ 
  regulatory, 
  compact = false 
}) => {
  if (!regulatory) return null;

  const hasKoreaMFDS = !!regulatory.korea_mfds;
  const hasFunctionalCert = !!regulatory.functional_certification;
  const hasClinicalTests = !!regulatory.clinical_test_results;
  const hasPatentedIngredients = !!regulatory.patented_ingredients;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-600">
        {hasKoreaMFDS && (
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="font-medium">Korea MFDS</span>
          </div>
        )}
        {hasFunctionalCert && (
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            <span>Certified</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Regulatory Compliance</h3>
      </div>

      {/* Korea MFDS Compliance - Prioritized */}
      {regulatory.korea_mfds && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-900">Korea MFDS Compliance</h4>
          </div>
          <p className="text-sm text-green-800 leading-relaxed">
            {regulatory.korea_mfds}
          </p>
        </div>
      )}

      {/* Functional Certification */}
      {regulatory.functional_certification && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Functional Certification</h4>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            {regulatory.functional_certification}
          </p>
        </div>
      )}

      {/* Clinical Test Results */}
      {regulatory.clinical_test_results && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Clinical Test Results</h4>
          </div>
          <p className="text-sm text-purple-800 leading-relaxed">
            {regulatory.clinical_test_results}
          </p>
        </div>
      )}

      {/* Patented Ingredients */}
      {regulatory.patented_ingredients && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <h4 className="font-semibold text-orange-900">Patented Ingredients</h4>
          </div>
          <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
            {regulatory.patented_ingredients}
          </p>
        </div>
      )}

      {/* Other Regulatory Information */}
      {regulatory.other_regulatory && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Other Regulatory Information</h4>
          <p className="text-sm text-gray-800 leading-relaxed">
            {regulatory.other_regulatory}
          </p>
        </div>
      )}

      {/* Compliance Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          {hasKoreaMFDS && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Korea MFDS
            </span>
          )}
          {hasFunctionalCert && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Certified
            </span>
          )}
          {hasClinicalTests && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <FileText className="w-3 h-3 mr-1" />
              Clinically Tested
            </span>
          )}
          {hasPatentedIngredients && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <AlertCircle className="w-3 h-3 mr-1" />
              Patented
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductRegulatory;
