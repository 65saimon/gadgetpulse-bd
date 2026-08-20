'use client';

import React, { useState, useEffect } from 'react';
import { BANGLADESH_DIVISIONS } from '../../lib/bangladesh-geo';
import { MapPin } from 'lucide-react';

interface AddressSelectorProps {
  division: string;
  district: string;
  upazila: string;
  onChange: (data: { division: string; district: string; upazila: string }) => void;
}

export const BangladeshiAddressSelector: React.FC<AddressSelectorProps> = ({
  division,
  district,
  upazila,
  onChange,
}) => {
  const [selectedDivision, setSelectedDivision] = useState(division || 'Dhaka');
  const [selectedDistrict, setSelectedDistrict] = useState(district || 'Dhaka');
  const [selectedUpazila, setSelectedUpazila] = useState(upazila || 'Gulshan');

  const currentDivObj = BANGLADESH_DIVISIONS.find((d) => d.name === selectedDivision) || BANGLADESH_DIVISIONS[0];
  const availableDistricts = currentDivObj.districts;
  const currentDistObj = availableDistricts.find((d) => d.name === selectedDistrict) || availableDistricts[0];
  const availableUpazilas = currentDistObj ? currentDistObj.upazilas : [];

  const handleDivisionChange = (divName: string) => {
    setSelectedDivision(divName);
    const newDivObj = BANGLADESH_DIVISIONS.find((d) => d.name === divName) || BANGLADESH_DIVISIONS[0];
    const newDist = newDivObj.districts[0]?.name || '';
    const newUpz = newDivObj.districts[0]?.upazilas[0] || '';
    setSelectedDistrict(newDist);
    setSelectedUpazila(newUpz);
    onChange({ division: divName, district: newDist, upazila: newUpz });
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    const newDistObj = availableDistricts.find((d) => d.name === distName);
    const newUpz = newDistObj?.upazilas[0] || '';
    setSelectedUpazila(newUpz);
    onChange({ division: selectedDivision, district: distName, upazila: newUpz });
  };

  const handleUpazilaChange = (upzName: string) => {
    setSelectedUpazila(upzName);
    onChange({ division: selectedDivision, district: selectedDistrict, upazila: upzName });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Division *</label>
        <select
          value={selectedDivision}
          onChange={(e) => handleDivisionChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
        >
          {BANGLADESH_DIVISIONS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
        <select
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
        >
          {availableDistricts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Area / Thana *</label>
        <select
          value={selectedUpazila}
          onChange={(e) => handleUpazilaChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
        >
          {availableUpazilas.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
