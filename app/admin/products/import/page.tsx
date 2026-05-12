'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface ParsedProduct {
  name: string;
  price: number;
  category: string;
  brand?: string;
  manufacturer?: string;
  origin?: string;
  size?: string;
  stock_quantity?: number;
  description?: string;
  how_to_use?: string;
  key_ingredients?: string;
  key_benefits?: string;
  skin_types?: string;
  texture?: string;
  formula?: string;
  skin_concerns?: string;
  customer_type?: string;
  status?: string;
  featured?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    imported: number;
    errors: number;
    skipped: number;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (csvFile && csvFile.type === 'text/csv' || csvFile.name.endsWith('.csv')) {
      if (csvFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(csvFile);
      parseCSV(csvFile);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const parseCSV = (csvFile: File) => {
    setIsParsing(true);
    setParsedData([]);
    setValidationErrors([]);
    setImportResults(null);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as ParsedProduct[];
        const errors: ValidationError[] = [];

        // Validate each row
        data.forEach((row, index) => {
          const rowNum = index + 2; // +2 because of header and 0-based index

          // Validate required fields
          if (!row.name || row.name.trim() === '') {
            errors.push({ row: rowNum, field: 'name', message: 'Name is required' });
          } else if (row.name.trim().length < 3) {
            errors.push({ row: rowNum, field: 'name', message: 'Name must be at least 3 characters' });
          }

          if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) {
            errors.push({ row: rowNum, field: 'price', message: 'Price must be a positive number' });
          }

          if (!row.category || row.category.trim() === '') {
            errors.push({ row: rowNum, field: 'category', message: 'Category is required' });
          }

          // Convert numeric fields
          if (row.price) row.price = Number(row.price);
          if (row.stock_quantity) row.stock_quantity = Number(row.stock_quantity);
          if (row.featured) row.featured = row.featured === 'true' ? 'true' : 'false';
        });

        setParsedData(data);
        setValidationErrors(errors);
        setIsParsing(false);

        if (errors.length > 0) {
          toast.error(`Found ${errors.length} validation errors`);
        } else {
          toast.success(`Parsed ${data.length} products successfully`);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error('Failed to parse CSV file');
        setIsParsing(false);
      }
    });
  };

  const downloadTemplate = async () => {
    try {
      const response = await apiClient.downloadImportTemplate();
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch (error: any) {
      toast.error('Failed to download template');
    }
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    if (parsedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      const response = await apiClient.importProducts(parsedData);
      setImportResults(response);
      toast.success(`Imported ${response.imported} products successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to import products');
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setImportResults(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/catalog"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Catalog
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Import Products</h1>
          <p className="text-slate-600 mt-2">Bulk import products from CSV file</p>
        </div>

        {!file && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Download Template</h2>
              <p className="text-slate-600 mb-4">
                Download the CSV template to see the required format and sample data.
              </p>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                <Download size={16} className="mr-2" />
                Download Template
              </button>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Upload CSV File</h2>
              <p className="text-slate-600 mb-4">
                Drag and drop your CSV file here, or click to browse. Maximum file size: 5MB.
              </p>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">
                  {isDragActive ? 'Drop the CSV file here' : 'Drag & drop CSV file, or click to select'}
                </p>
                <p className="text-sm text-slate-500 mt-2">Maximum file size: 5MB</p>
              </div>
            </div>
          </div>
        )}

        {file && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText size={24} className="mr-3 text-slate-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900">{file.name}</h3>
                    <p className="text-sm text-slate-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Clear
                </button>
              </div>

              {isParsing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-slate-900" size={32} />
                  <span className="ml-3 text-slate-600">Parsing CSV file...</span>
                </div>
              )}

              {!isParsing && parsedData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-900 font-semibold">
                        {parsedData.length} products ready to import
                      </p>
                      {validationErrors.length > 0 && (
                        <p className="text-red-600 text-sm">
                          {validationErrors.length} validation errors found
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleImport}
                      disabled={validationErrors.length > 0 || isImporting}
                      className="inline-flex items-center px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Importing...
                        </>
                      ) : (
                        'Import Products'
                      )}
                    </button>
                  </div>

                  {importResults && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">Import Results</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 size={16} className="mr-2" />
                          {importResults.imported} imported
                        </div>
                        <div className="flex items-center text-red-600">
                          <AlertCircle size={16} className="mr-2" />
                          {importResults.errors} errors
                        </div>
                        <div className="flex items-center text-slate-600">
                          {importResults.skipped} skipped
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <h3 className="font-semibold text-red-900 mb-4 flex items-center">
                  <AlertCircle size={20} className="mr-2" />
                  Validation Errors
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-red-200">
                        <th className="text-left py-2 px-3 text-sm font-semibold text-red-900">Row</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold text-red-900">Field</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold text-red-900">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationErrors.map((error, index) => (
                        <tr key={index} className="border-b border-red-100">
                          <td className="py-2 px-3 text-sm text-red-800">{error.row}</td>
                          <td className="py-2 px-3 text-sm text-red-800">{error.field}</td>
                          <td className="py-2 px-3 text-sm text-red-800">{error.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {parsedData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Preview (First 10 Rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Name</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Price</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Category</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Brand</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((product, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 px-3 text-slate-700">{product.name}</td>
                          <td className="py-2 px-3 text-slate-700">${product.price}</td>
                          <td className="py-2 px-3 text-slate-700">{product.category}</td>
                          <td className="py-2 px-3 text-slate-700">{product.brand || '-'}</td>
                          <td className="py-2 px-3 text-slate-700">{product.stock_quantity || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <p className="text-sm text-slate-600 mt-4">
                    Showing 10 of {parsedData.length} rows
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
