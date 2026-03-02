import { useState } from 'react'
import type { Result } from '../types/Result'
import { isSuccess, isError, createSuccess, createError } from '../types/Result'

interface ResultDemoProps {
	result?: Result
}

export default function ResultDemo({ result }: ResultDemoProps) {
	const [isCollapsed, setIsCollapsed] = useState(true)

	// Pre-compute aria-expanded value as string
	const ariaExpanded = isCollapsed ? 'false' : 'true'
	// Example of how to handle discriminated unions
	const handleResult = (result: Result) => {
		// Type-safe pattern matching using discriminated unions
		switch (result.kind) {
			case 'success':
				return (
					<div className='demo-result demo-success'>
						<span className='demo-icon'>✅</span>
						<span className='demo-text'>Success: {result.data}</span>
					</div>
				)
			case 'error':
				return (
					<div className='demo-result demo-error'>
						<span className='demo-icon'>❌</span>
						<span className='demo-text'>Error: {result.message}</span>
					</div>
				)
			default: {
				// TypeScript ensures exhaustiveness - this line will never be reached
				const _exhaustive: never = result
				return _exhaustive
			}
		}
	}

	// Alternative approach using type guards (also type-safe)
	const handleResultWithTypeGuards = (result: Result) => {
		if (isSuccess(result)) {
			// TypeScript knows this is { kind: "success"; data: string }
			return (
				<div className='demo-result demo-success'>
					<span className='demo-icon'>✅</span>
					<span className='demo-text'>Success: {result.data}</span>
				</div>
			)
		}

		if (isError(result)) {
			// TypeScript knows this is { kind: "error"; message: string }
			return (
				<div className='demo-result demo-error'>
					<span className='demo-icon'>❌</span>
					<span className='demo-text'>Error: {result.message}</span>
				</div>
			)
		}

		// This should never happen with proper discriminated unions
		return null
	}

	const exampleSuccess = createSuccess("User 'John Doe' created successfully!")
	const exampleError = createError(
		"A user with the name 'Jane Smith' already exists. Please choose a different name.",
	)

	return (
		<div className='result-demo'>
			<div className='demo-header'>
				<h3>🎯 Discriminated Union Demo</h3>
				<button
					type='button'
					className='collapse-toggle'
					onClick={() => setIsCollapsed(!isCollapsed)}
					aria-expanded={ariaExpanded}
				>
					{isCollapsed ? '▶️' : '🔽'} {isCollapsed ? 'Show' : 'Hide'} Demo
				</button>
			</div>
			{!isCollapsed && (
				<div className='demo-content'>
					<p>
						This showcases type-safe result handling with discriminated unions:
					</p>

					<div className='demo-section'>
						<h4>Pattern Matching Approach:</h4>
						<div className='demo-examples'>
							{handleResult(exampleSuccess)}
							{handleResult(exampleError)}
						</div>
					</div>

					<div className='demo-section'>
						<h4>Type Guards Approach:</h4>
						<div className='demo-examples'>
							{handleResultWithTypeGuards(exampleSuccess)}
							{handleResultWithTypeGuards(exampleError)}
						</div>
					</div>

					{result && (
						<div className='demo-section'>
							<h4>Live Result from Last Operation:</h4>
							<div className='demo-examples'>{handleResult(result)}</div>
						</div>
					)}

					<div className='demo-code'>
						<h4>💡 Type Safety Benefits:</h4>
						<ul>
							<li>
								<strong>Exhaustiveness:</strong> TypeScript ensures all cases
								are handled
							</li>
							<li>
								<strong>Type Narrowing:</strong> Compiler knows exact properties
								available
							</li>
							<li>
								<strong>No Runtime Errors:</strong> Prevents accessing wrong
								properties
							</li>
							<li>
								<strong>Refactor Safety:</strong> Adding new result types shows
								compilation errors
							</li>
						</ul>
					</div>
				</div>
			)}
		</div>
	)
}
