import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders Enrolled badge properly', () => {
    render(<StatusBadge status="ENROLLED" />);
    expect(screen.getByText('Enrolled')).toBeInTheDocument();
  });

  it('renders Settled (DBT Paid) badge properly', () => {
    render(<StatusBadge status="SETTLED" />);
    expect(screen.getByText('Settled (DBT Paid)')).toBeInTheDocument();
  });

  it('renders L1 Approved badge properly', () => {
    render(<StatusBadge status="LEVEL1_APPROVED" />);
    expect(screen.getByText('L1 Approved')).toBeInTheDocument();
  });

  it('renders Rejected badge properly', () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});
